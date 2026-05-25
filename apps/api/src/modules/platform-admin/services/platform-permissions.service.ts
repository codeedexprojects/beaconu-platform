import { ConflictError, NotFoundError } from "@/shared/errors";
import { PlatformPermissionsRepository } from "../repositories/platform-permissions.repository";
import {
  CreatePlatformPermissionData,
  UpdatePlatformPermissionData,
} from "../validators/platform-permissions.validator";

export class PlatformPermissionsService {
  static async listPermissions() {
    return PlatformPermissionsRepository.findAll();
  }

  static async createPermission(data: CreatePlatformPermissionData) {
    const existing = await PlatformPermissionsRepository.findByCode(data.code);
    if (existing) throw new ConflictError("Permission code already exists");

    return PlatformPermissionsRepository.create(data);
  }

  static async updatePermission(
    id: string,
    data: UpdatePlatformPermissionData,
  ) {
    const permission = await PlatformPermissionsRepository.findById(id);
    if (!permission) throw new NotFoundError("Permission not found");

    if (data.code && data.code !== permission.code) {
      const existing = await PlatformPermissionsRepository.findByCode(
        data.code,
      );
      if (existing) throw new ConflictError("Permission code already exists");
    }

    return PlatformPermissionsRepository.update(id, data);
  }

  static async deletePermission(id: string) {
    const permission = await PlatformPermissionsRepository.findById(id);
    if (!permission) throw new NotFoundError("Permission not found");

    return PlatformPermissionsRepository.delete(id);
  }
}

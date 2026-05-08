import { NotFoundError } from '@/shared/errors';
import { CounsellorRepository } from './counsellors.repository';
import { UpdateMyProfileData, UpdateCounsellorStatusData } from './counsellors.types';

export class CounsellorService {
  static async getMyProfile(userId: string) {
    const counsellor = await CounsellorRepository.findById(userId);
    if (!counsellor) throw new NotFoundError('Counsellor not found');
    return counsellor;
  }

  static async updateMyProfile(userId: string, data: UpdateMyProfileData) {
    const counsellor = await CounsellorRepository.findById(userId);
    if (!counsellor) throw new NotFoundError('Counsellor not found');

    const updated = await CounsellorRepository.updateById(userId, {
      ...(data.full_name ? { fullName: data.full_name } : {}),
      ...(data.phone_number !== undefined ? { phoneNumber: data.phone_number } : {}),
      ...(data.avatar_url !== undefined ? { avatarUrl: data.avatar_url } : {}),
    });

    return updated;
  }

  static async listAll(filters: { counsellor_type?: string; status?: string }) {
    return CounsellorRepository.findAll({
      counsellorType: filters.counsellor_type,
      status: filters.status,
    });
  }

  static async getById(id: string) {
    const counsellor = await CounsellorRepository.findById(id);
    if (!counsellor) throw new NotFoundError('Counsellor not found');
    return counsellor;
  }

  static async updateStatus(id: string, data: UpdateCounsellorStatusData) {
    const counsellor = await CounsellorRepository.findById(id);
    if (!counsellor) throw new NotFoundError('Counsellor not found');
    return CounsellorRepository.updateStatus(id, data.status);
  }
}

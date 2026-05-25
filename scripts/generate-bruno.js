const fs = require("fs");
const path = require("path");

const basePath = path.join(__dirname, "..", "packages/api-contracts");

const collections = [
  // Super Admin
  {
    path: "admin/colleges/folder.bru",
    content: `meta {
  name: Colleges
}
`,
  },
  {
    path: "admin/colleges/list-colleges.bru",
    content: `meta {
  name: List Colleges
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/api/v1/admin/colleges
  body: none
  auth: bearer
}

auth:bearer {
  token: {{adminToken}}
}
`,
  },
  {
    path: "admin/colleges/get-college.bru",
    content: `meta {
  name: Get College
  type: http
  seq: 2
}

get {
  url: {{baseUrl}}/api/v1/admin/colleges/:id
  body: none
  auth: bearer
}

auth:bearer {
  token: {{adminToken}}
}
`,
  },
  {
    path: "admin/colleges/get-stats.bru",
    content: `meta {
  name: Get Stats
  type: http
  seq: 3
}

get {
  url: {{baseUrl}}/api/v1/admin/colleges/stats/overview
  body: none
  auth: bearer
}

auth:bearer {
  token: {{adminToken}}
}
`,
  },

  // Staff Auth
  {
    path: "staff/folder.bru",
    content: `meta {
  name: Staff
}
`,
  },
  {
    path: "staff/auth/folder.bru",
    content: `meta {
  name: Auth
}
`,
  },
  {
    path: "staff/auth/login.bru",
    content: `meta {
  name: Staff Login
  type: http
  seq: 1
}

post {
  url: {{baseUrl}}/api/v1/auth/staff/login
  body: json
  auth: none
}

body:json {
  {
    "email": "admin@college.edu",
    "password": "Password123!"
  }
}
`,
  },
  {
    path: "staff/auth/verify-setup-token.bru",
    content: `meta {
  name: Verify Setup Token
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/api/v1/auth/staff/verify-setup-token
  body: json
  auth: none
}

body:json {
  {
    "token": "YOUR_SETUP_TOKEN"
  }
}
`,
  },
  {
    path: "staff/auth/setup-account.bru",
    content: `meta {
  name: Setup Account
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/api/v1/auth/staff/setup-account
  body: json
  auth: none
}

body:json {
  {
    "token": "YOUR_SETUP_TOKEN",
    "password": "NewPassword123!"
  }
}
`,
  },

  // College Admin Setup
  {
    path: "college-admin/folder.bru",
    content: `meta {
  name: College Admin
}
`,
  },
  {
    path: "college-admin/profile/folder.bru",
    content: `meta {
  name: Profile
}
`,
  },
  {
    path: "college-admin/profile/get-profile.bru",
    content: `meta {
  name: Get Profile
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/api/v1/college-admin/profile
  body: none
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}
`,
  },
  {
    path: "college-admin/profile/update-profile.bru",
    content: `meta {
  name: Update Profile
  type: http
  seq: 2
}

patch {
  url: {{baseUrl}}/api/v1/college-admin/profile
  body: json
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}

body:json {
  {
    "address": "123 Main St",
    "city": "Noida",
    "state": "UP",
    "pinCode": "201301"
  }
}
`,
  },
  {
    path: "college-admin/profile/submit-setup.bru",
    content: `meta {
  name: Submit Setup
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/api/v1/college-admin/profile/submit
  body: none
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}
`,
  },
  {
    path: "college-admin/campuses/folder.bru",
    content: `meta {
  name: Campuses
}
`,
  },
  {
    path: "college-admin/campuses/list-campuses.bru",
    content: `meta {
  name: List Campuses
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/api/v1/college-admin/campuses
  body: none
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}
`,
  },
  {
    path: "college-admin/campuses/create-campus.bru",
    content: `meta {
  name: Create Campus
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/api/v1/college-admin/campuses
  body: json
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}

body:json {
  {
    "name": "Main Campus",
    "address": "123 Campus Lane",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "pinCode": "201301",
    "isMainCampus": true
  }
}
`,
  },
  {
    path: "college-admin/courses/folder.bru",
    content: `meta {
  name: Courses
}
`,
  },
  {
    path: "college-admin/courses/list-courses.bru",
    content: `meta {
  name: List Courses
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/api/v1/college-admin/courses
  body: none
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}
`,
  },
  {
    path: "college-admin/courses/create-course.bru",
    content: `meta {
  name: Create Course
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/api/v1/college-admin/courses
  body: json
  auth: bearer
}

auth:bearer {
  token: {{staffToken}}
}

body:json {
  {
    "name": "Bachelor of Technology in Computer Science",
    "code": "BTECH-CSE",
    "disciplineId": "discipline_uuid_here",
    "studyLevelId": "study_level_uuid_here",
    "programTypeId": "program_type_uuid_here",
    "studyMode": "FULL_TIME",
    "intakeCapacity": 120,
    "duration": "4 years",
    "eligibility": "10+2 with Physics, Chemistry and Mathematics",
    "campusId": "campus_uuid_here"
  }
}
`,
  },

  // Public
  {
    path: "public/colleges/folder.bru",
    content: `meta {
  name: Colleges
}
`,
  },
  {
    path: "public/colleges/get-by-slug.bru",
    content: `meta {
  name: Get College By Slug
  type: http
  seq: 1
}

get {
  url: {{baseUrl}}/api/v1/public/colleges/by-slug/:slug
  body: none
  auth: none
}
`,
  },
];

collections.forEach((file) => {
  const fullPath = path.join(basePath, file.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, file.content, "utf-8");
});

console.log("Bruno collections created successfully.");

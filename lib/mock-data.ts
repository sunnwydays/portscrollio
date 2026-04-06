export interface Project {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  githubUrl: string;
  tech: string; // comma-separated
  isHobby: boolean;
  bgFrom: string; // gradient placeholder
  bgTo: string;
  tags: string; // comma-separated display tags shown on video
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  views: string;
  timeAgo: string;
  videoUrl: string | null;
  tags: string; // comma-separated
  bgFrom: string;
  bgTo: string;
  duration: string; // e.g. "12:45"
}

export interface Stat {
  key: string;
  label: string;
  value: string;
}

export interface Settings {
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  status: string;
  latestCommit: string;
}

// ─── Projects (For You feed) ──────────────────────────────────────────────────

export const mockProjects: Project[] = [
  {
    id: "luminous-logic-core",
    title: "Luminous Logic Core",
    description:
      "A high-performance orchestration layer built for micro-latency environments. Architected with safety first.",
    videoUrl: "https://youtube.com",
    githubUrl: "https://github.com",
    tech: "Rust,React,TypeScript,Distributed Systems,gRPC",
    isHobby: false,
    bgFrom: "#061a1a",
    bgTo: "#0b2d25",
    tags: "DISTRIBUTED SYSTEMS,RUST",
  },
  {
    id: "robot-arm",
    title: "6-DOF Robot Arm for my Dorm",
    description:
      "Designing and building a 6-degree-of-freedom robot arm entirely from scratch. Inverse kinematics, custom PCBs, and 3D-printed joints.",
    videoUrl: "https://youtube.com",
    githubUrl: "https://github.com",
    tech: "Python,ROS2,C++,MG90S,BambuLab A1,SolidWorks",
    isHobby: false,
    bgFrom: "#0a1020",
    bgTo: "#12203a",
    tags: "HARDWARE,ROBOTICS",
  },
  {
    id: "gym-montage",
    title: "A Year of Lifting",
    description:
      "From 60 kg to 100 kg power clean in 12 months. The grind, the failures, and what actually worked.",
    videoUrl: "https://youtube.com",
    githubUrl: "",
    tech: "",
    isHobby: true,
    bgFrom: "#1a0a0a",
    bgTo: "#2d1010",
    tags: "HOBBY,FITNESS",
  },
  {
    id: "kernel-rust",
    title: "Writing a Kernel in Rust",
    description:
      "Day 45 of building an OS from scratch in Rust. No libc. No safety net. Just page tables and existential dread.",
    videoUrl: "https://youtube.com",
    githubUrl: "https://github.com",
    tech: "Rust,x86-64,RISC-V,Assembly",
    isHobby: false,
    bgFrom: "#0a0a1a",
    bgTo: "#10102d",
    tags: "OPERATING SYSTEMS,RUST",
  },
  {
    id: "esp32-overclock",
    title: "Overclocking the ESP32 until it Melts",
    description:
      "How far can you push a $5 microcontroller? Further than Espressif wants you to know.",
    videoUrl: "https://youtube.com",
    githubUrl: "https://github.com",
    tech: "C++,ESP32,FreeRTOS,Embedded Systems",
    isHobby: false,
    bgFrom: "#1a0f00",
    bgTo: "#2d1a00",
    tags: "EMBEDDED,HARDWARE",
  },
  {
    id: "llm-zero-dollars",
    title: "Training LLMs on $0",
    description:
      "A computer engineer's guide to fine-tuning language models using free GPU quotas, clever batching, and patience.",
    videoUrl: "https://youtube.com",
    githubUrl: "https://github.com",
    tech: "Python,PyTorch,Transformers,CUDA,Google Colab",
    isHobby: false,
    bgFrom: "#0d0a1a",
    bgTo: "#1a1030",
    tags: "MACHINE LEARNING,AI",
  },
];

// ─── Posts (Explore grid) ─────────────────────────────────────────────────────

export const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "6-dof-robot-arm-dorm",
    title: "Why I'm Building a 6-DOF Robot Arm for my Dorm",
    category: "Hardware Engineering",
    views: "15k",
    timeAgo: "2 days ago",
    videoUrl: "https://youtube.com",
    tags: "Hardware,Robotics",
    bgFrom: "#0a1020",
    bgTo: "#12203a",
    duration: "12:45",
  },
  {
    id: "post-2",
    slug: "kernel-rust-day-45",
    title: "Writing a Kernel in Rust: Day 45 Update",
    category: "Operating Systems",
    views: "42k",
    timeAgo: "1 week ago",
    videoUrl: "https://youtube.com",
    tags: "Rust,Low-Level",
    bgFrom: "#0a0a1a",
    bgTo: "#10102d",
    duration: "08:12",
  },
  {
    id: "post-3",
    slug: "training-llms-zero-dollars",
    title: "Training LLMs on $0: A Computer Engineer's Guide",
    category: "Machine Learning",
    views: "108k",
    timeAgo: "3 weeks ago",
    videoUrl: "https://youtube.com",
    tags: "Machine Learning,AI",
    bgFrom: "#0d0a1a",
    bgTo: "#1a1030",
    duration: "15:02",
  },
  {
    id: "post-4",
    slug: "esp32-overclock",
    title: "Overclocking the ESP32 until it Melts",
    category: "Embedded Systems",
    views: "89k",
    timeAgo: "1 month ago",
    videoUrl: "https://youtube.com",
    tags: "Hardware,Embedded",
    bgFrom: "#1a0f00",
    bgTo: "#2d1a00",
    duration: "22:10",
  },
  {
    id: "post-5",
    slug: "autonomous-sorting-v2",
    title: "Autonomous Sorting System: v2.0 Reveal",
    category: "Automation",
    views: "31k",
    timeAgo: "2 months ago",
    videoUrl: "https://youtube.com",
    tags: "Hardware,Robotics",
    bgFrom: "#061a0a",
    bgTo: "#0b2d15",
    duration: "18:33",
  },
  {
    id: "post-6",
    slug: "custom-tor-node",
    title: "The Engineering Behind a Custom Tor Node",
    category: "Cybersecurity",
    views: "27k",
    timeAgo: "3 months ago",
    videoUrl: null,
    tags: "Cybersecurity,Low-Level",
    bgFrom: "#0a0a0a",
    bgTo: "#1a1a2d",
    duration: "10:48",
  },
];

// ─── Sidebar data ─────────────────────────────────────────────────────────────

export const mockStats: Stat[] = [
  { key: "robot_arm", label: "Robot Arm Automation", value: "0%" },
  { key: "power_clean_3rm", label: "Power Clean 3RM", value: "100 kg" },
];

export const mockSettings: Settings = {
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  resumeUrl: "/resume.pdf",
  status: "Building at aUToronto",
  latestCommit: "Updated Chrome Ext manifest",
};

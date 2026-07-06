export interface Project {
  id: string;
  slug?: string;
  title: string;
  description: string;
  /** Bullet points on core engineering challenges, one per line. */
  challenges: string;
  video_url: string;
  github_url: string;
  website_url?: string;
  tech: string;
  is_hobby: boolean;
  bg_from: string;
  bg_to: string;
  tags: string;
  published_at: string | null;
}

export interface Post {
  id: string;
  slug?: string;
  title: string;

  video_url: string | null;
  thumbnail_url: string | null;
  tags: string;
  bg_from: string;
  bg_to: string;
  duration: string | null;
  published_at: string;
  /** Comma-separated slugs of related posts. Connections are undirected. */
  related?: string | null;
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
    challenges:
      "Keeping p99 latency under 2ms across a gRPC mesh under load\nDesigning a lock-free scheduler in Rust without sacrificing safety guarantees\nBuilding a TypeScript control panel that reflects live cluster state",
    video_url: "https://youtube.com",
    github_url: "https://github.com",
    tech: "Rust,React,TypeScript,Distributed Systems,gRPC",
    is_hobby: false,
    bg_from: "#061a1a",
    bg_to: "#0b2d25",
    tags: "DISTRIBUTED SYSTEMS,RUST",
    published_at: "2024-02-10T00:00:00Z",
  },
  {
    id: "robot-arm",
    title: "6-DOF Robot Arm for my Dorm",
    description:
      "Designing and building a 6-degree-of-freedom robot arm entirely from scratch. Inverse kinematics, custom PCBs, and 3D-printed joints.",
    challenges:
      "Deriving inverse kinematics for a 6-DOF arm without a commercial solver\nTuning MG90S servo control loops for smooth, non-jittery motion\nDesigning 3D-printed joints tolerant enough for repeatable precision",
    video_url: "https://youtube.com",
    github_url: "https://github.com",
    tech: "Python,ROS2,C++,MG90S,BambuLab A1,SolidWorks",
    is_hobby: false,
    bg_from: "#0a1020",
    bg_to: "#12203a",
    tags: "HARDWARE,ROBOTICS",
    published_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "gym-montage",
    title: "A Year of Lifting",
    description:
      "From 60 kg to 100 kg power clean in 12 months. The grind, the failures, and what actually worked.",
    challenges: "",
    video_url: "https://youtube.com",
    github_url: "",
    tech: "",
    is_hobby: true,
    bg_from: "#1a0a0a",
    bg_to: "#2d1010",
    tags: "HOBBY,FITNESS",
    published_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "kernel-rust",
    title: "Writing a Kernel in Rust",
    description:
      "Day 45 of building an OS from scratch in Rust. No libc. No safety net. Just page tables and existential dread.",
    challenges:
      "Writing a page table walker with zero libc and no std\nDebugging triple faults with only a serial port and patience\nGetting Rust's borrow checker to cooperate with raw MMIO access",
    video_url: "https://youtube.com",
    github_url: "https://github.com",
    tech: "Rust,x86-64,RISC-V,Assembly",
    is_hobby: false,
    bg_from: "#0a0a1a",
    bg_to: "#10102d",
    tags: "OPERATING SYSTEMS,RUST",
    published_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "esp32-overclock",
    title: "Overclocking the ESP32 until it Melts",
    description:
      "How far can you push a $5 microcontroller? Further than Espressif wants you to know.",
    challenges:
      "Pushing the ESP32 clock past spec without corrupting flash reads\nManaging thermal runaway with only passive cooling\nKeeping FreeRTOS tasks stable as timing margins collapsed",
    video_url: "https://youtube.com",
    github_url: "https://github.com",
    tech: "C++,ESP32,FreeRTOS,Embedded Systems",
    is_hobby: false,
    bg_from: "#1a0f00",
    bg_to: "#2d1a00",
    tags: "EMBEDDED,HARDWARE",
    published_at: "2024-02-20T00:00:00Z",
  },
  {
    id: "llm-zero-dollars",
    title: "Training LLMs on $0",
    description:
      "A computer engineer's guide to fine-tuning language models using free GPU quotas, clever batching, and patience.",
    challenges:
      "Fitting fine-tuning runs into free-tier Colab's session and memory limits\nCheckpointing aggressively enough to survive random session kills\nBatching and gradient accumulation to approximate a much bigger GPU",
    video_url: "https://youtube.com",
    github_url: "https://github.com",
    tech: "Python,PyTorch,Transformers,CUDA,Google Colab",
    is_hobby: false,
    bg_from: "#0d0a1a",
    bg_to: "#1a1030",
    tags: "MACHINE LEARNING,AI",
    published_at: "2024-01-15T00:00:00Z",
  },
];

// ─── Posts (Explore grid) ─────────────────────────────────────────────────────

export const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "6-dof-robot-arm-dorm",
    title: "Why I'm Building a 6-DOF Robot Arm for my Dorm",

    video_url: "https://youtube.com",
    thumbnail_url: null,
    tags: "Hardware,Robotics",
    bg_from: "#0a1020",
    bg_to: "#12203a",
    duration: "12:45",
    published_at: "2024-01-01T00:00:00Z",
    related: "kernel-rust-day-45",
  },
  {
    id: "post-2",
    slug: "kernel-rust-day-45",
    title: "Writing a Kernel in Rust: Day 45 Update",

    video_url: "https://youtube.com",
    thumbnail_url: null,
    tags: "Rust,Low-Level",
    bg_from: "#0a0a1a",
    bg_to: "#10102d",
    duration: "08:12",
    published_at: "2024-01-08T00:00:00Z",
    related: "training-llms-zero-dollars",
  },
  {
    id: "post-3",
    slug: "training-llms-zero-dollars",
    title: "Training LLMs on $0: A Computer Engineer's Guide",

    video_url: "https://youtube.com",
    thumbnail_url: null,
    tags: "Machine Learning,AI",
    bg_from: "#0d0a1a",
    bg_to: "#1a1030",
    duration: "15:02",
    published_at: "2024-01-15T00:00:00Z",
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

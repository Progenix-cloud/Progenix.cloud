type RoadmapItem = {
  title: string;
  description: string;
  image: string;
};

export const roadmap: RoadmapItem[] = [
  {
    title: "User Requirements",
    description: "BRD Documents",
    image: "user-requirements.jpg",
  },
  {
    title: "Technical Mapping",
    description: "System Design",
    image: "technical-mapping.jpg",
  },
  {
    title: "HLD LLD",
    description: "High Level Design, Low Level Design",
    image: "hld-lld.jpg",
  },
  {
    title: "Project Mapping",
    description: "Cost, Team, Time, Infra Requirements",
    image: "project-mapping.jpg",
  },
  {
    title: "SDLC Lifecycle",
    description: "With Revisions",
    image: "sdlc-lifecycle.jpg",
  },
  {
    title: "Lifetime Infra Management",
    description: "Ongoing Infrastructure Support",
    image: "lifetime-infra.jpg",
  },
];
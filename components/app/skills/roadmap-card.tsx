import Image from "next/image";
import styles from "styles/modules/skills.module.css";

type RoadmapCardProps = {
  title: string;
  description: string;
  image: string;
  isActive: boolean;
  index?: number;
};

const RoadmapCard = ({ title, description, image, isActive }: RoadmapCardProps) => {
  return (
    <div
      className={`${styles.roadmap__card} ${isActive ? styles.active : ''} bg-white rounded-lg shadow-lg p-6`}
    >
      <div className="relative h-32 mb-4 overflow-hidden rounded-md">
        <div className={styles.roadmap__image}>
          <Image
            src={`/roadmap/${image}`}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default RoadmapCard;
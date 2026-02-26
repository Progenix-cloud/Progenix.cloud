import Image from "next/image";
import Link from "next/link";
import SliderContainer from "components/app/clients/slider-container/slider-container";
import SliderItem from "components/app/clients/slider-item/slider-item";
import { clients } from "@/lib/constants/app/clients";

const ClientsLogos = async () => {
  return (
    <>
      <SliderContainer initialOffsetX={0} contentWidth={1290}>
        {clients.slice(0, 9).map((client) => (
          <SliderItem key={client.name} width={150}>
            <Link href={client.link} target="_blank" rel="noopener noreferrer">
              <Image
                src={`/logos/${client.logo}`}
                width={150}
                height={100}
                style={{
                  objectFit: "contain",
                }}
                alt={`${client.name} logo`}
              />
            </Link>
          </SliderItem>
        ))}
      </SliderContainer>
      <SliderContainer initialOffsetX={75} contentWidth={1290}>
        {clients.slice(9).map((client) => (
          <SliderItem key={client.name} width={150}>
            <Link href={client.link} target="_blank" rel="noopener noreferrer">
              <Image
                src={`/logos/${client.logo}`}
                width={150}
                height={100}
                style={{
                  objectFit: "contain",
                }}
                alt={`${client.name} logo`}
              />
            </Link>
          </SliderItem>
        ))}
      </SliderContainer>
    </>
  );
};

export default ClientsLogos;

import Image from "next/image";

export default function CompanyLogo({ url }: { url: string }) {
  return (
    <div className="bg-white rounded-[0.438rem] mr-2 min-w-[1.875rem] min-h-[1.875rem] flex items-center justify-center">
      <div style={{ width: "1.5rem", height: "1.5rem", display: "flex" }}>
        <Image
          src={url}
          alt="Company logo"
          width={24} // actual width of the image
          height={24} // actual height of the image
          className="rounded-[0.438rem]"
          style={{
            objectFit: "contain",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import { Category } from "@/types";
import Link from "next/link";
import { getImageUrl } from "@/utils/apiUtils";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <Link href={`/category/${item.slug}`} className="group flex flex-col items-center w-[150px] flex-shrink-0">
      <div className="w-[130px] h-[130px] bg-[#F2F3F8] rounded-full flex items-center justify-center mb-4 overflow-hidden flex-shrink-0">
        <Image 
          src={item.image ? getImageUrl(item.image) : "/images/categories/categories-01.png"} 
          alt={item.name} 
          width={130} 
          height={130}
          className="object-contain w-full h-full p-3"
          style={{ 
            objectPosition: 'center',
            objectFit: 'contain'
          }}
        />
      </div>

      <div className="flex justify-center w-full">
        <h3 className="text-sm font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue max-w-[130px] break-words">
          {item.name}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;

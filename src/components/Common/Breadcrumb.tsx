import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  pages: Array<{
    name: string;
    href?: string;
  }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ title, pages }) => {
  return (
    <nav 
      className="overflow-hidden shadow-breadcrumb pt-[209px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]"
      aria-label="Breadcrumb"
    >
      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-semibold text-dark text-xl sm:text-2xl xl:text-custom-2">
              {title}
            </h1>

            <ol 
              className="flex items-center gap-2"
              aria-label="Breadcrumb navigation"
            >
              <li className="text-custom-sm">
                <Link 
                  href="/" 
                  className="hover:text-blue transition-colors duration-200"
                  aria-label="Anasayfaya git"
                >
                  Anasayfa
                </Link>
                <span className="mx-2 text-gray-400">/</span>
              </li>

              {pages.map((page, index) => (
                <li 
                  key={index}
                  className={`text-custom-sm ${
                    index === pages.length - 1 
                      ? 'text-blue font-medium' 
                      : 'text-gray-600'
                  }`}
                >
                  {page.href ? (
                    <>
                      <Link 
                        href={page.href}
                        className="hover:text-blue transition-colors duration-200 capitalize"
                        aria-label={`${page.name} sayfasına git`}
                      >
                        {page.name}
                      </Link>
                      {index < pages.length - 1 && (
                        <span className="mx-2 text-gray-400">/</span>
                      )}
                    </>
                  ) : (
                    <span className="capitalize" aria-current="page">
                      {page.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;

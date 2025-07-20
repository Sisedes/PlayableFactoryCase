import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Anasayfa",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Kategoriler",
    newTab: false,
    path: "/",
    submenu: [] // Bu dinamik olarak doldurulacak
  },
  {
    id: 3,
    title: "Ürünler",
    newTab: false,
    path: "/shop-with-sidebar",
  },
];

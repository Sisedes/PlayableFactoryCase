import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import RecentlyViewed from "@/components/RecentlyViewed";
import Newsletter from "@/components/Common/Newsletter";
import Recommendations from "./Recommendations";

const Home = () => {
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals />
      <BestSeller />
      <Recommendations />
      <RecentlyViewed />
      <Newsletter />
    </>
  );
};

export default Home;

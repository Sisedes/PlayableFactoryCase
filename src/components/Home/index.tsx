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
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Categories Section */}
      <Categories />
      
      {/* New Arrivals Section */}
      <NewArrivals />
      
      {/* Best Seller Section */}
      <BestSeller />
      
      {/* Recommendations Section */}
      <Recommendations />
      
      {/* Recently Viewed Section */}
      <RecentlyViewed />
      
      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
};

export default Home;

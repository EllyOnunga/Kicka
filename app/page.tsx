import Layout from "../components/Layout";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";


export default function Home () {
  return (
    <Layout>
      <HeroSection />
      <FeaturedCategories />
  
    </Layout>
  )
}
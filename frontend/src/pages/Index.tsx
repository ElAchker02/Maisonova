import { Layout } from '@/components/layout/Layout';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PacksSection } from '@/components/packs/PacksSection';
import { ProductsSection } from '@/components/products/ProductsSection';
import { TopSalesSection } from '@/components/products/TopSalesSection';

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <CategoriesSection />
      <PacksSection />
      <ProductsSection />
      <TopSalesSection />
    </Layout>
  );
};

export default Index;

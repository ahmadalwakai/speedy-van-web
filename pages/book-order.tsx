import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BookOrder from '@/components/BookOrder';

export default function BookOrderPage() {
  return <BookOrder />;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'order'])),
    },
  };
}
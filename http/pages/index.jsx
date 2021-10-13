import { useRouter } from 'next/router';
import axios from 'axios';
import nookies from 'nookies';
import { Header, Footer } from '../components';



export async function getStaticProps() {
  // get current 
  try {
    const res = await fetch('http://localhost:1337/section');
    const sections = await res.json();

    return {
      props: { sections }
    }
  } catch (error) {
    return { props: { sections: [] } }
  }
}




export default function Home({ user }) {
  const router = useRouter();
  const goToPricing = () => {
    router.push('/pricing');
  }
  const goToLearnMore = () => {
    router.push('/learn');
  }

  return (
    <div>
      {JSON.stringify(user)}
      <div>
        <Header />
        <section className="superheader container">
          <h1 className="row">
            <div className="col-2"></div>
            <div className="col-8">Stream to every video platform all at once.</div>
            <div className="col-2"></div>
          </h1>
          <div className="row">
            <div className="col-3"></div>
            <div className="col-6">Boost views with simple tools to setup live-feeds, webinars, and multi-platform video channels.</div>
            <div className="col-3"></div>
          </div>
          <div className="row">
            <div className="col-4"></div>
            <div className="col-2"><button onClick={goToPricing} className='call-to-action'>See Pricing</button></div>
            <div className="col-2"><button onClick={goToLearnMore} className='call-to-action'>Learn More</button></div>
            <div className="col-4"></div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  )
}

import { useEffect } from 'react';

export {};

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type DisplayAdsProps = {
  client: string;
  slot: string;
  auto?: boolean;
  responsive?: boolean;
};

/* data-ad-client='ca-pub-7748316956330968' */
/* data-ad-slot='3545458418' */

/*
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6589893128899904"
   crossorigin="anonymous"></script>
   <!-- 수평형1 -->
   <ins class="adsbygoogle"
   style="display:block"
   data-ad-client="ca-pub-6589893128899904"
   data-ad-slot="9732378227"
   data-ad-format="auto"
   data-full-width-responsive="true"></ins>
   <script>
   (adsbygoogle = window.adsbygoogle || []).push({});
   </script>
 */


/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6589893128899904"
   crossorigin="anonymous"></script>
   <!-- 세로고정1 -->
   <ins class="adsbygoogle"
   style="display:inline-block;width:140px;height:400px"
   data-ad-client="ca-pub-6589893128899904"
   data-ad-slot="2910204606"></ins>
   <script>
   (adsbygoogle = window.adsbygoogle || []).push({});
   </script> */

const propAuto = { 'data-ad-format': 'auto' };
const propResponsive = {'data-full-width-responsive': 'true'};

export default function DisplayAds({client, slot, auto, responsive }: DisplayAdsProps) {

  const otherProps = { ...(auto && propAuto), ...(responsive && propResponsive) };
  
  useEffect(() => {
    const pushAd = () => {
      try {
        const adsbygoogle = window.adsbygoogle
        // console.log({ adsbygoogle })
        adsbygoogle.push({})
      } catch (e) {
        console.error(e)
      }
    }

    let interval = setInterval(() => {
      // Check if Adsense script is loaded every 300ms
      if (window.adsbygoogle) {
        pushAd()
        // clear the interval once the ad is pushed so that function isn't called indefinitely
        clearInterval(interval)
      }
    }, 300)

    return () => {
      clearInterval(interval)
    }
  }, []);

  return (
    <ins
      className='adsbygoogle'
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      {...otherProps}
    ></ins>
  );
}


function FlexibleBox1() {
  return (
    <DisplayAds
      client={'ca-pub-6589893128899904'}
      slot={'9732378227'}
      auto={true}
      responsive={true}
    />);
}


function FixedVertical1() {
  return (
    <DisplayAds
      client={'ca-pub-6589893128899904'}
      slot={'2910204606'} />);
}


function FlexibleHorizontal1() {
  return (
    <DisplayAds
      client={'ca-pub-6589893128899904'}
      slot={'3961443693'}
      auto={true}
      responsive={true}
    />)
}

DisplayAds.FlexibleBox1 = FlexibleBox1;
DisplayAds.FixedVertical1 = FixedVertical1;
DisplayAds.FlexibleHorizontal1 = FlexibleHorizontal1;

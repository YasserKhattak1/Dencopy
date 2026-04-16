import Image from 'next/image';
import NewsletterDialog from '@/components/NewsletterDialog';
import ScrollCue from '@/components/ScrollCue';

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container logo-wrap">
          <Image
            src="/den-logo.svg"
            alt="Den"
            width={160}
            height={64}
            className="logo"
            priority
          />
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="container hero-grid">
            <div className="hero-copy">
              <h1 id="hero-heading" className="hero-heading">
                The future of switches is coming.
              </h1>
            </div>
            <div className="hero-media">
              {/* Flat PNG rasterised once from the brand SVG so mobile
                  browsers don't resample the multi-layer SVG at tiny
                  sizes — that's what was producing the fuzzy borders. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-image.png"
                alt=""
                className="hero-image"
                decoding="async"
                width={2400}
                height={1350}
              />
            </div>
          </div>
        </section>

        <section id="video" className="video" aria-label="Product video">
          <div className="container">
            <div className="video-frame">
              <iframe
                src="https://player.vimeo.com/video/261310683?title=0&byline=0&portrait=0&dnt=1"
                title="Den video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="newsletter" aria-label="Newsletter signup">
          <div className="container newsletter-inner">
            <NewsletterDialog />
          </div>
        </section>

        <section className="contact" aria-label="Contact">
          <div className="container contact-inner">
            <a className="contact-link" href="mailto:hello@getden.co.uk">
              hello@getden.co.uk
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p className="copyright">Copyright Den Innovation Ltd 2026</p>
        </div>
      </footer>

      <ScrollCue />
    </>
  );
}

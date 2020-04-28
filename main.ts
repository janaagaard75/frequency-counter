class WordFrequencyCounter {
  constructor(private sitemapUrl: string) {}

  public start() {
    console.info(`Starting with sitemapUrl ${this.sitemapUrl}.`);
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault();
  const counter = new WordFrequencyCounter(sitemapUrl);
  counter.start();
}

class WordFrequencyCounter {
  constructor(private sitemapUrl: string) {}

  public async start() {
    const response = await fetch(this.sitemapUrl)
    const sitemapString = await response.text()

    const parser = new DOMParser()
    const sitemap = parser.parseFromString(sitemapString, "application/xml")

    console.info(`Sitemap entries: ${sitemap.children[0].children.length}.`)
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault()
  const counter = new WordFrequencyCounter(sitemapUrl)
  counter.start()
}

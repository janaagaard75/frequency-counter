class WordFrequencyCounter {
  constructor(private sitemapUrl: string) {}

  public async start() {
    const outputElement = document.getElementById("output")
    if (outputElement === null) {
      return
    }

    outputElement.innerHTML = "Fetching..."

    const response = await fetch(this.sitemapUrl)
    const sitemapString = await response.text()
    const parser = new DOMParser()
    const sitemap = parser.parseFromString(sitemapString, "application/xml")
    const urls = Array.from(sitemap.querySelectorAll("loc")).map(
      (loc) => loc.textContent
    )

    outputElement.innerHTML = urls.join("\n")
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault()
  const counter = new WordFrequencyCounter(sitemapUrl)
  counter.start()
}

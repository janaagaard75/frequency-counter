function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

class WordFrequencyCounter {
  constructor(private sitemapUrl: string) {}

  public async start() {
    const statusElement = document.getElementById("status")
    const outputElement = document.getElementById("output")
    if (statusElement === null || outputElement === null) {
      return
    }

    statusElement.innerHTML = "Fetching"
    outputElement.innerHTML = ""

    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + this.sitemapUrl
    )

    const sitemapString = await response.text()
    const parser = new DOMParser()
    const sitemap = parser.parseFromString(sitemapString, "application/xml")
    const pageUrls = Array.from(sitemap.querySelectorAll("loc"))
      .map((loc) => loc.textContent)
      .filter(notEmpty)
      .map((pageUrl) => `<a href="${pageUrl}">${pageUrl}</a>`)

    outputElement.innerHTML = pageUrls.join("\n")

    const fetchWordsTasks = pageUrls
      .slice(0, 20)
      .map((pageUrl) => this.fetchWords(pageUrl))
    const minimumWordLength = 5
    const words = (await Promise.all(fetchWordsTasks))
      .flat()
      .filter((word) => word.length >= minimumWordLength)

    const occurrencesObject = words.reduce<{
      [index: string]: { word: string; count: number }
    }>(
      (accumulator, word) => (
        (accumulator[word.toLowerCase()] = {
          word: word,
          count: (accumulator[word.toLowerCase()]?.count || 0) + 1,
        }),
        accumulator
      ),
      {}
    )

    const occurrencesArray: Array<{ word: string; count: number }> = []
    for (var prop in occurrencesObject) {
      if (occurrencesObject.hasOwnProperty(prop)) {
        occurrencesArray.push(occurrencesObject[prop])
      }
    }

    const sorted = occurrencesArray.sort(
      (wordCountA, wordCountB) => wordCountB.count - wordCountA.count
    )

    outputElement.innerHTML += "\n"

    sorted
      .slice(0, 50)
      .forEach(
        (wordCount) =>
          (outputElement.innerHTML += `\n${wordCount.word}: ${wordCount.count}`)
      )

    statusElement.innerHTML = "Done"
  }

  private async fetchWords(pageUrl: string): Promise<Array<string>> {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + pageUrl
    )
    const html = await response.text()
    const parser = new DOMParser()
    const document = parser.parseFromString(html, "text/html")
    const headers = document.querySelectorAll("title,h1,h2,h3,h4,h5,h6")
    let content = Array.from(headers)
      .map((header) => header.textContent)
      .join(" ")
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription !== null) {
      content += " " + metaDescription.textContent
    }
    const words = content
      .replace(/[^a-zA-ZæøåÆØÅ0-9]/g, " ")
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word !== "")
    return words
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault()
  const counter = new WordFrequencyCounter(sitemapUrl)
  counter.start()
}

;(window as any).start = start

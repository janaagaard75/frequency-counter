function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

class UniqueCharacterFinder {
  constructor(private sitemapUrl: string) {
    this.outputElement = this.getElement("output") as HTMLDivElement;
    this.statusElement = this.getElement("status") as HTMLDivElement;
  }

  private outputElement: HTMLDivElement;
  private statusElement: HTMLDivElement;

  private getElement(elementId: string): HTMLElement {
    const element = document.getElementById(elementId);
    if (element === null) {
      throw new Error(`Did not find an element with id '${elementId}'.`);
    }
    return element;
  }

  public async start() {
    this.setStatus("Fetching");
    this.setOutput("");

    const pageUrls = await this.getPageUrls(this.sitemapUrl);

    this.setOutput(pageUrls.join("\n"));

    const fetchWordsTasks = pageUrls
      .slice(0, 20)
      .map((pageUrl) => this.fetchWords(pageUrl));
    const minimumWordLength = 5;
    const words = (await Promise.all(fetchWordsTasks))
      .flat()
      .filter((word) => word.length >= minimumWordLength);

    const occurrencesObject = words.reduce<{
      [index: string]: { word: string; count: number };
    }>(
      (accumulator, word) => (
        (accumulator[word.toLowerCase()] = {
          word: word,
          count: (accumulator[word.toLowerCase()]?.count || 0) + 1,
        }),
        accumulator
      ),
      {}
    );

    const occurrencesArray: Array<{ word: string; count: number }> = [];
    for (var prop in occurrencesObject) {
      if (occurrencesObject.hasOwnProperty(prop)) {
        occurrencesArray.push(occurrencesObject[prop]);
      }
    }

    const sorted = occurrencesArray.sort(
      (wordCountA, wordCountB) => wordCountB.count - wordCountA.count
    );

    this.addOutput("\n");

    sorted
      .slice(0, 50)
      .forEach((wordCount) =>
        this.addOutput(`\n${wordCount.word}: ${wordCount.count}`)
      );

    this.setStatus("Done");
  }

  private addOutput(output: string) {
    this.outputElement.innerHTML += output;
  }

  private setOutput(output: string) {
    this.outputElement.innerHTML = output;
  }

  private setStatus(status: string) {
    this.statusElement.innerHTML = status;
  }

  private async getPageUrls(sitemapUrl: string): Promise<Array<string>> {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + sitemapUrl
    );

    const sitemapString = await response.text();
    const parser = new DOMParser();
    const sitemap = parser.parseFromString(sitemapString, "application/xml");
    const pageUrls = Array.from(sitemap.querySelectorAll("loc"))
      .map((loc) => loc.textContent)
      .filter(notEmpty)
      .map((pageUrl) => `<a href="${pageUrl}">${pageUrl}</a>`);

    return pageUrls;
  }

  private async fetchText(pageUrl: string): Promise<string> {
    throw new Error("Not implemented.");
  }

  private async fetchWords(pageUrl: string): Promise<Array<string>> {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + pageUrl
    );
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const headers = document.querySelectorAll("title,h1,h2,h3,h4,h5,h6");
    let content = Array.from(headers)
      .map((header) => header.textContent)
      .join(" ");
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription !== null) {
      content += " " + metaDescription.textContent;
    }
    const words = content
      .replace(/[^a-zA-ZæøåÆØÅ0-9]/g, " ")
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word !== "");
    return words;
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault();
  const characterFinder = new UniqueCharacterFinder(sitemapUrl);
  characterFinder.start();
}

(window as any).start = start;

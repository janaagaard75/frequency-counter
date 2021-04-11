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

    this.setOutput(`Found ${pageUrls.length} URLs in sitemap.`);

    const fetchTextTasks = pageUrls
      .slice(0, 50)
      .map((pageUrl) => this.fetchText(pageUrl));

    const texts = (await Promise.all(fetchTextTasks)).flat();
    this.addOutput(`\nFetched ${texts.length} pages.`);
    this.addOutput(
      `\nPage lengths: ${texts.map((text) => text.length).join(", ")}.`
    );

    const uniqueCharacters = this.getUniqueCharacters(texts.join())
      .filter((char) => char !== " ")
      .sort();

    this.addOutput(`\nUnique characters:\n${uniqueCharacters.join("\n")}`);
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

  private getUniqueCharacters(text: string): Array<string> {
    return new Array(...new Set(text));
  }

  private async getPageUrls(sitemapUrl: string): Promise<Array<string>> {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + sitemapUrl
    );

    const sitemapString = await response.text();
    this.addOutput(`\nLength of sitemap: ${sitemapString.length}.`);

    const parser = new DOMParser();
    const sitemap = parser.parseFromString(sitemapString, "application/xml");
    this.addOutput(`Sitemap: ${sitemap.documentElement.innerHTML}`);

    const pageUrls = Array.from(sitemap.querySelectorAll("loc"))
      .map((loc) => loc.textContent)
      .filter(notEmpty);
    // .map((pageUrl) => `<a href="${pageUrl}">${pageUrl}</a>`);

    return pageUrls;
  }

  private async fetchText(pageUrl: string): Promise<string> {
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/" + pageUrl
    );
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const text = document.documentElement.textContent ?? "";
    return text;
  }
}

function start(sitemapUrl: string) {
  event?.preventDefault();
  const characterFinder = new UniqueCharacterFinder(sitemapUrl);
  characterFinder.start();
}

(window as any).start = start;

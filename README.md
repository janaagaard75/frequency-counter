# Word Frequency Counter

Crawl a website, count the words and order them by frequency.

## Conclusion

This problem is a lot harder than I anticipated. The current solution is able to fetch all the pages and list the words by frequency, but the result isn't worth much because the words in the header and the footer og the pages are overrepresented. It's also necessary to filter out uninteresting words like 'the' and 'and'. We can get rid of most of them by removing the sort words, but if we want to include a word like 'cloud', the cannot set the minimum length lower than five. If a website has a lot of pages, the system might also run into performance issues. Looking only at the title, meta description and headers does not give a better result.

I don't understand why or how the cors-anywhere thing works. But it does.

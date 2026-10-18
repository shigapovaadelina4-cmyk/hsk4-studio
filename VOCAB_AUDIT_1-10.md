# HSK 4A — vocabulary audit for lessons 1–10

**Status: completed for flashcard vocabulary.** Compared Chinese headwords in printed order against the uploaded **HSK-4A-Textbook.pdf**, including the separately boxed **专有名词** (proper names). Pinyin and Russian glosses were reviewed. This audit is only for flashcards; it does not certify the grammar, audio, workbook, or exercise content.

| Lesson | Numbered 生词 | Proper names 专有名词 | Total cards |
|---|---:|---:|---:|
| 1 简单的爱情 | 32 | 5 | **37** |
| 2 真正的朋友 | 30 | 4 | **34** |
| 3 经理对我印象不错 | 31 | 2 | **33** |
| 4 不要太着急赚钱 | 31 | 1 | **32** |
| 5 只买对的，不买贵的 | 31 | 0 | **31** |
| 6 一分钱一分货 | 31 | 0 | **31** |
| 7 最好的医生是自己 | 33 | 0 | **33** |
| 8 生活中不缺少美 | 29 | 0 | **29** |
| 9 阳光总在风雨后 | 31 | 2 | **33** |
| 10 幸福的标准 | 30 | 0 | **30** |
| **TOTAL** | **309** | **14** | **323** |

The 14 proper-name cards are exactly the names in the textbook's 专有名词 boxes, preserved in their own printed name order within each lesson:

- 1: 孙月 · 王静 · 李进 · 李 · 高
- 2: 夏 · 马克 · 林 · 张远
- 3: 小雨 · 马
- 4: 王
- 9: 王红 · 爱迪生

The numbered 生词 entries retain their numbered order; proper names are shown after them so existing progress on ordinary vocabulary is not shifted. No names have been invented. The example fields are empty instead of using unverified Chinese example sentences.

## Site changes and verification

- Removed unused draft practice vocabulary for lessons 6–10 and the unsourced card example banks.
- Retained existing CSS/layout, pronunciation control, and **Знаю / Не знаю** buttons.
- Corrected lesson 10 heading to **幸福的标准**.
- Added runtime integrity assertions for lessons 2–10, checking counts, duplicates, and nonempty Chinese/pinyin/Russian fields.
- Added `scripts/verify-vocab.mjs` and `.github/workflows/verify-hsk4.yml` so GitHub automatically checks all ten vocabulary sets, proper names, inline JavaScript syntax, expected counts, no duplicate headwords, no invented example fields, and retention of the familiar study controls on each push.
- The GitHub Actions run [Verify HSK 4A flashcards](https://github.com/shigapovaadelina4-cmyk/hsk4-studio/actions/runs/39116282826) completed successfully.

**Limit of the check:** GitHub's automatic check validates JavaScript parsing and vocabulary assembly, rather than running a full interactive mobile-browser end-to-end test. GitHub Pages deployment is checked separately.

Source reference: uploaded textbook scan **HSK-4A-Textbook.pdf**, lessons 1–10 and their 生词 / 专有名词 boxes. No general HSK word bank was used as a replacement.

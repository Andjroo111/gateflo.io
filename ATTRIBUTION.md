# Attribution

GateFlo.io is based on Nimipay, an open-source cryptocurrency payment gateway. We are grateful to the original authors and contributors of Nimipay for their work.

## Original Project

- **Project Name:** Nimipay
- **Original Author:** Gie Katon
- **Copyright Year:** 2019
- **Original Website:** https://nimipay.com
- **Original Description:** A simple and flexible payments gateway that creates an overlayed UI for interaction with NIM wallet, shopping cart, and items.

## Technical Acknowledgments

The original Nimipay implementation utilized:
- [Reef.js](https://github.com/cferdinandi/reef) (4kb) for reactive UI components
- [Nimiq Hub API](https://nimiq.github.io/hub/quick-start) for payments processing
- [MeekroDB](https://meekro.com/) for MySQL database operations

## Original License

The original Nimipay project was released under the MIT License:

```
MIT License

Copyright (c) 2019 Gie Katon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Technical Divergence and Modifications

While GateFlo.io was initially inspired by Nimipay's concept of cryptocurrency payments, it has evolved into a substantially different project with its own unique architecture and capabilities. The key differences include:

### Architecture Changes
- Completely reimplemented in modern JavaScript without PHP dependency
- Replaced Reef.js with a more sophisticated build system using Rollup
- Removed MySQL/MeekroDB dependency in favor of client-side implementation
- Modernized codebase with ES modules and contemporary JavaScript practices

### Enhanced Capabilities
- Extended from single-currency (NIM) to multi-currency support (BTC, NIM, USDC, USDT)
- Implemented automatic style detection for seamless integration
- Added real-time price conversion across multiple cryptocurrencies
- Integrated Web3.js for expanded blockchain interactions
- Developed multiple payment handlers for different cryptocurrencies

### Integration Improvements
- Streamlined integration process with zero backend requirements
- Enhanced documentation and examples
- Improved error handling and transaction monitoring
- Added automated price fetching and conversion

While the project has diverged significantly from its original inspiration, we maintain this attribution in accordance with the MIT License terms and in appreciation of the original concept. All modifications and new features are released under the same MIT License, preserving the open-source nature of both projects.

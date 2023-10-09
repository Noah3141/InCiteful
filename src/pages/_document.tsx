import Document, { Html, Head, Main, NextScript } from "next/document";
export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <meta name="theme-color" content="#ffffff" />
                </Head>
                <body className="bg-sand-200 text-tango-900">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

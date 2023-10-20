import Document, { Html, Head, Main, NextScript } from "next/document";
export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <meta name="theme-color" content="#ffffff" />
                    <link
                        rel="icon"
                        type="image/x-icon"
                        href="./images/logos/InCitefulSmallLogo.svg"
                    />
                </Head>
                <body className="h-full min-h-screen bg-sand-200 font-semibold text-tango-900">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

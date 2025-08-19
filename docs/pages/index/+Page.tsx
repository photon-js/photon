export { Page };

import type React from "react";
import logoWithText from "../../assets/logo-with-text.svg";

function Page() {
  return (
    <>
      <Block noMargin>
        <Header />
        <p>Photon is ... TODO</p>
        <LoremIpsum />
      </Block>
      <Block>
        <LoremIpsum />
        <div style={{ height: 30 }} />
      </Block>
    </>
  );
}

function Header() {
  return (
    <>
      <h1 style={{ textAlign: "center", fontSize: "3.4em" }}>
        <img src={logoWithText} height={50} />
      </h1>
    </>
  );
}

function Block({ children, noMargin }: { children: React.ReactNode; noMargin?: true }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        display: "flex",
        justifyContent: "center",
        paddingBottom: 20,
        marginTop: noMargin ? 0 : "var(--block-margin)",
      }}
    >
      <div style={{ maxWidth: 1000 }}>{children}</div>
    </div>
  );
}

function LoremIpsum() {
  return (
    <div>
      <p>
        Praesent <em>eu augue lacinia</em>, tincidunt purus nec, ultrices ante. Donec dolor felis, ornare vel augue
        condimentum.
      </p>
      <p>
        Mauris <code>foo</code> quis scelerisque erat.
      </p>
      <p>
        <i>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i>
      </p>
      <p>
        <b>Curabitur</b> gravida urna id ligula volutpat dapibus. Integer accumsan dignissim efficitur. Sed mauris
        tortor, lobortis at suscipit ac, ultricies eu nunc.
      </p>
      <p>
        Sed molestie tempus &mdash; <b>elementum</b>.
      </p>
    </div>
  );
}

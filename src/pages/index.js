import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import { Search } from "lucide-react";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      
      <div className="container">
        <h1 className={styles.title}>How can we help?</h1>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Type your query and hit Enter"
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title}`} description="Help center for Facilio">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}

import clsx from "clsx";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";
import {
  FileText,
  Shield,
  Smartphone,
  Zap,
  BarChart2,
  Users,
  LayoutGrid, // Correctly imported LayoutGrid icon
} from "lucide-react";

const FeatureList = [
  {
    title: "Role-Based Access Control",
    icon: FileText,
    description:
      "Understand Role-Based Access Control (RBAC) and its implementation. Learn how to define roles, permissions, and multi-tenant access within your system.",
    link: "/docs/category/RBAC",
    color: "#FEF3C7",
  },
  {
    title: "Appsync",
    icon: LayoutGrid, // Using the LayoutGrid icon
    description:
      "Understand Role-Based Access Control (RBAC) and its implementation. Learn how to define roles, permissions, and multi-tenant access within your system.",
    link: "/docs/category/RBAC",
    color: "#FEF3C7",
  },
];

function Feature({ icon: Icon, title, description, link, color }) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <div  className={styles.featureCard}>
        <div className={styles.featureHeader}>
          <div
            className={styles.featureIconWrapper}
            style={{ backgroundColor: color }}
          >
            <Icon className={styles.featureIcon} />
          </div>
          <h3 className={styles.featureTitle}>{title}</h3>
        </div>
        <p className={styles.featureDescription}>{description}</p>
        <div className={styles.featureLink}>
          <Link to={link}>See More</Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import DeveloperActivitySvg from '@site/static/img/undraw_developer_activity_re_39tg.svg';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Stats for Commits',
    Svg: DeveloperActivitySvg,
    description: (
      <>
        The end-goal of this project is to produce metrics that persist across commits. Linter messages, test failures,
        etc. Stats into your database, in your CI pipeline. A bunch of scripts that you can use to build something
        better. But... it's early days.
      </>
    ),
  }
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--12')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
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

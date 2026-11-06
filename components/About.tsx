import { Card, PageHeader } from "./ui";

export default function About() {
  return (
    <div>
      <PageHeader
        title="About"
        description="What this system is, who it is for, and what it can do."
      />

      <div className="space-y-4">
        <Card title="What is this system?">
          <p className="text-sm text-slate-700">
            The Statistical Analysis System is a web-based tool that helps students perform
            statistical calculations, interpret the results, and view graphs through a simple,
            organized interface.
          </p>
        </Card>

        <Card title="Educational purpose">
          <p className="text-sm text-slate-700">
            It was built for a college statistics course. The formulas, interpretation ranges, and
            decision rules match the class lessons so students can compare the computer results with
            their hand calculations. It is a learning aid, not a replacement for professional
            statistical software.
          </p>
        </Card>

        <Card title="Supported statistical methods">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Simple Linear Regression and Correlation
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Least-squares slope (B) and intercept (A)</li>
                <li>Regression equation ŷ = A + Bx</li>
                <li>Pearson correlation coefficient (r) and its strength</li>
                <li>Prediction of Y for a given X</li>
                <li>Scatter plot with the fitted line</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Hypothesis Testing</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>One-sample Z-test for a mean</li>
                <li>Two-sample Z-test for two independent means</li>
                <li>Left-, right-, and two-tailed tests at α = 0.10, 0.05, 0.01</li>
                <li>Critical values, rejection region, and decision</li>
                <li>Standard normal curve with the rejection region shaded</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="Good to know">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Everything runs in your browser. No data is stored, and refreshing the page clears it.</li>
            <li>
              The Z-test needs known population standard deviation(s) and a random sample. The lesson
              uses it for samples of size 30 or more.
            </li>
            <li>
              A correlation shows that two variables move together. It does not prove that one
              causes the other.
            </li>
            <li>The T-test is not part of this version.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

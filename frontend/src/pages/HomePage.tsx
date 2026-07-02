import { PageHeader, Button } from '../components/ui';
import { APP_BRANDING_COPY, HOME_PAGE_COPY } from '../constants/uiCopy';
import { useWorkflowNavigation } from '../hooks/useWorkflowNavigation';

export function HomePage() {
  const { navigateToCapture, navigateToFeedData } = useWorkflowNavigation();

  return (
    <>
      <PageHeader
        title={APP_BRANDING_COPY.title}
        subtitle={APP_BRANDING_COPY.subtitle}
        className="w-full"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        {/* <Button size="lg" variant="secondary" onClick={navigateToFeedData}>
          {HOME_PAGE_COPY.feedDataButtonLabel}
        </Button> */}
        <Button size="lg" onClick={navigateToCapture}>
          {HOME_PAGE_COPY.getStartedButtonLabel}
        </Button>
      </div>
    </>
  );
}

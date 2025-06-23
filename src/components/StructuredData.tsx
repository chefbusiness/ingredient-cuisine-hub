
import { useEffect } from 'react';

interface StructuredDataProps {
  data: any;
  id?: string;
}

const StructuredData = ({ data, id = 'structured-data' }: StructuredDataProps) => {
  useEffect(() => {
    // Remove existing structured data script if it exists
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data script
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
};

export default StructuredData;

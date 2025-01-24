import { parse } from 'react-docgen';
import fs from 'fs';

const content = fs.readFileSync('src/App.jsx', 'utf8');
try {
    const componentInfo = parse(content);
    console.log(JSON.stringify(componentInfo, null, 2));
} catch (error) {
    console.error('Error parsing component:', error);
}

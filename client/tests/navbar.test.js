import { render, onCleanup } from "solid-js/web";
import { test } from "@jest/globals";
import Navbar from "../src/components/Navbar/Navbar";

test("Assert links are displayed", () => {
    document.body.innerHTML = `<div id="test-root"></div>`;
    const root = document.getElementById('test-root'); 
    const div = document.createElement('div');
    root.appendChild(div);
    
    render(() => <Navbar />, div);
    //const items = document.querySelectorAll(".desk-routes");
    //expect(items.length).toBe(3);

    onCleanup(() => {
      root.removeChild(div);
    });
    // More tests here...
});
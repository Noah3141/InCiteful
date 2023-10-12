import React from "react";
import Hall from "~/layouts/Hall";

const Notebook = () => {
    return (
        <div className="mx-auto max-w-7xl px-3">
            <div className="flex flex-row gap-3">
                <div className="h-96  bg-neutral-600">
                    <div className="w-40">
                        <h1>Topics + Add topic</h1>
                        <div className="max-h-96"></div>
                    </div>
                    <div>
                        <h1>List</h1>
                        <div className="max-h-96 overflow-y-scroll">
                            <div>1</div>
                            <div className="text-tango-500">2</div>
                            <div>3</div>
                        </div>
                    </div>
                </div>
                <div className="h-screen  w-full  ">
                    <div className="max-h-[70vh] bg-neutral-700">
                        <div>
                            Citable References for Given topic &quot;2&quot;
                        </div>
                        <div className="flex flex-row justify-between">
                            <div>reference view</div>
                            <div>notes box</div>
                        </div>
                    </div>
                    <div className="h-96 bg-neutral-400">Topic notes</div>
                </div>
            </div>
        </div>
    );
};

export default Notebook;

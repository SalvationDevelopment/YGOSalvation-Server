import React, { useState, useEffect } from 'react';
import ForumService from './../../services/forum.service';

export default function Forum() {


    const [service, renewService] = useState(new ForumService('')),
        [sections, updateSections] = useState([]);

    useEffect(() => {
        service.homepage()
            .then((updatedHomepage) => {
                updateSections(updatedHomepage);
            });
    }, [service]);

    function login(session) {
        renewService(new ForumService(session));
    }

    return <div id='longsection'>
        {sections}
    </div>;
}
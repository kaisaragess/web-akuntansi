"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar/page";
import { AxiosCaller } from "../../../../axios-client/axios-caller/AxiosCaller";

const journalsPage = () => {
    return(
        <div>
            <h1>Ini halaman Jurnal</h1>
        </div>
    );
}


export default journalsPage;
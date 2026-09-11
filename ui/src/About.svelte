<script lang="ts">
  import { version } from 'api/src/vars'
  import { license } from './gpl3'
</script>

<div class="legal-copy flex flex-col gap-4">
  <div>
    <h3 class="text-2xl font-bold text-blue-500">Meshsense Black Edition</h3>
    <p>Version {$version || 'development'} · Modified 11 September 2026</p>
  </div>
  <p>Based on the open-source MeshSense project by Affirmatech Inc. This is an independent modified version, not an official Affirmatech release. No endorsement or trademark permission is claimed.</p>
  <p>Original MeshSense: copyright remains with Affirmatech Inc. and its contributors. Black Edition modifications: © 2026 the respective contributors. Existing copyright and licence notices are retained in the source.</p>
  <p>This modified program is licensed under the GNU General Public License, version 3. You may use, study, modify and redistribute it under that licence. It is provided without warranty; see the full licence below.</p>
  <div class="flex flex-wrap gap-2">
    <a class="btn" href="/black-edition-source.zip" download>Download this version's source</a>
    <a class="btn" href="/LICENSE.txt" download>GPL v3 licence</a>
    <a class="btn" href="/THIRD-PARTY-NOTICES.txt" download>Third-party notices</a>
    <a class="btn" href="/LICENSE.electron.txt" download>Electron licence</a>
    <a class="btn" href="/LICENSES.chromium.html" download>Chromium notices</a>
  </div>
  <p>The source bundle includes this edition's modifications, dependency sources, retained notices and build instructions. If you share the installer, provide the matching source bundle alongside it. No public source repository has been published for this edition.</p>
  <p>Modifications include the black/orange theme, independent branding, separate there/back traceroutes, clearer map layout, node-data requests, temporary status messages and role-display fixes.</p>
  <p><a href="https://github.com/Affirmatech/MeshSense" target="_blank" rel="noreferrer">Original MeshSense source</a> · <a href="https://affirmatech.com" target="_blank" rel="noreferrer">Affirmatech</a></p>
  <details><summary>Original project's warranty notice</summary><p>Affirmatech, Inc. disclaims all liability for damages (consequential and otherwise) arising from the use of this product. No other warranty is given.</p></details>
  <details><summary>Full GNU GPL v3 licence</summary><pre class="whitespace-pre-wrap text-xs max-h-80 overflow-auto p-3">{license}</pre></details>
</div>

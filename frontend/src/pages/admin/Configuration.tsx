import React from 'react';

const Configuration: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">System Configuration</h1>
      <div className="mt-6">
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <form action="#" method="POST">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure general system settings and parameters.
                  </p>
                </div>

                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                      Site Name
                    </label>
                    <input
                      type="text"
                      name="site-name"
                      id="site-name"
                      defaultValue="BandBoost"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact-email"
                      id="contact-email"
                      defaultValue="support@bandboost.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="maintenance-mode" className="block text-sm font-medium text-gray-700">
                      Maintenance Mode
                    </label>
                    <select
                      id="maintenance-mode"
                      name="maintenance-mode"
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Configuration;

from setuptools import setup
from setuptools import find_packages

version = '0.0.1'

classifiers = """
Development Status :: 3 - Alpha
Intended Audience :: Developers
Operating System :: OS Independent
Programming Language :: JavaScript
Programming Language :: Python :: 3
Programming Language :: Python :: 3.5
Programming Language :: Python :: 3.6
""".strip().splitlines()

package_json = {
    "dependencies": {
    },
    "devDependencies": {
        "eslint": "~3.15.0",
    }
}

setup(
    name='portal_demo',
    version=version,
    description='Web demo of the portal',
    long_description=open('README.md').read(),
    classifiers=classifiers,
    keywords='',
    author='Auckland Bioengineering Institute',
    url='https://github.com/alan-wu/scaffoldmaker-web-demo',
    packages=find_packages('src', exclude=['ez_setup']),
    package_dir={'': 'src'},
    namespace_packages=[],
    zip_safe=False,
    install_requires=[
        'setuptools>=12',
        'sqlalchemy>=0.9',
        # 'opencmiss.zinc',
        'requests',
        'scaffoldmaker',
        'sanic',
        'itsdangerous',
        'M2Crypto',
    ],
    extras_require={
        'webpack': [
            'calmjs.webpack>=1.2.0',
        ],
    },
    package_json=package_json,
    calmjs_module_registry=['calmjs.module'],
    include_package_data=True,
    python_requires='>=3.5',
    build_calmjs_artifacts=True,
    entry_points={
        'console_scripts': [
            'portal_web = portal_demo.app:main',
        ],
        'calmjs.module': [
            'portal_demo = portal_demo',
        ],
        'calmjs.artifacts': [
            'bundle.js = calmjs.webpack.artifact:complete_webpack',
        ],
    },
    # test_suite="",
)
